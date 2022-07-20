using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using UnityEngine.XR.ARFoundation;
using System.IO;
using Newtonsoft.Json;
using UnityEngine.Networking;
using System.Linq;

public class QuizManager : MonoBehaviour
{
    public List<QuestionAndAnswers> QnA;
    public GameObject[] options;
    public int currentQuestion;
    public string filename;
    private string jsonContent = null;
    private string auth = "Bearer passwordispasswordissecret";
    private List<AssetData> assetsData = null;
    private AssetData assetData = null;
    private int points = 0;
    private int currentPoint = 0;

    public TMP_Text QuestionTxt;

    private void Start()
    {
        filename = PlayerPrefs.GetString("eventid") + ".txt";
        QnA = ReadQuizFromJSON(filename);
        GenerateQuestion();
    }

    public void NextQuestion()
    {
        QnA.RemoveAt(currentQuestion);
        if (QnA.Count <= 0)
        {
            assetsData = ReadAssetsDataFromJSON("AssetData.txt");
            assetsData = UpdateAsset(assetsData, PlayerPrefs.GetString("trackedimage"));
            WriteToFile("AssetData.txt", JsonConvert.SerializeObject(assetsData));
            assetData = GetAsset(assetsData, PlayerPrefs.GetString("trackedimage"));
            StartCoroutine(UpdatePoints());
        }
        GenerateQuestion();
        EnableOptions();
    }

    IEnumerator UpdatePoints()
    {
        string uri = "https://orbital-armazing.herokuapp.com/api/unity/points";
        WWWForm form = new WWWForm();

        form.AddField("eventID", PlayerPrefs.GetString("eventid"));
        form.AddField("username", PlayerPrefs.GetString("nickname"));
        form.AddField("points", points.ToString());
        form.AddField("assetID", assetData.id);
        Debug.Log(PlayerPrefs.GetString("eventid"));
        Debug.Log(PlayerPrefs.GetString("nickname"));
        Debug.Log(points);
        Debug.Log(assetData.id);
        using (UnityWebRequest request = UnityWebRequest.Post(uri, form))
        {
            request.SetRequestHeader("Authorization", auth);
            yield return request.SendWebRequest();
            if (request.isNetworkError || request.isHttpError)
            {
                Debug.Log(request.error);
            }
            else
            {
                UpdatePointsResponse response = GetUpdatePointsResponse(request.downloadHandler.text);

                if (response.status)
                {
                    Debug.Log(request.downloadHandler.text);
                    Debug.Log(response);
                    Debug.Log(response.error);
                    Debug.Log(response.msg);
                    yield return new WaitForSeconds(2);
                    LoaderUtility.Initialize();
                    SceneManager.LoadScene("AR", LoadSceneMode.Single);
                }
            }
        }
    }

    public UpdatePointsResponse GetUpdatePointsResponse(string jsonString)
    {
        if (string.IsNullOrEmpty(jsonString) || jsonString == "{}")
        {
            return null;
        }

        UpdatePointsResponse res = JsonConvert.DeserializeObject<UpdatePointsResponse>(jsonString);
        return res;
    }

    public void DisableOptions()
    {
        for (int i = 0; i < options.Length; i++)
        {
            options[i].GetComponent<Button>().interactable = false;
        }
    }

    public void EnableOptions()
    {
        for (int i = 0; i < options.Length; i++)
        {
            options[i].GetComponent<Button>().interactable = true;
        }
    }

    void SetAnswers()
    {
        options[0].transform.GetChild(0).GetComponent<TMP_Text>().text = QnA[currentQuestion].option1;
        options[1].transform.GetChild(0).GetComponent<TMP_Text>().text = QnA[currentQuestion].option2;
        options[2].transform.GetChild(0).GetComponent<TMP_Text>().text = QnA[currentQuestion].option3;
        options[3].transform.GetChild(0).GetComponent<TMP_Text>().text = QnA[currentQuestion].option4;

        currentPoint = QnA[currentQuestion].points;

        for (int i = 0; i < options.Length; i++)
        {
            options[i].GetComponent<AnswerButtonBehaviour>().isCorrect = false;

            if (QnA[currentQuestion].answer == i + 1)
            {
                options[i].GetComponent<AnswerButtonBehaviour>().isCorrect = true;
            }
        }
    }

    public void incrementPoints()
    {
        points += currentPoint;
    }

    void GenerateQuestion()
    {
        if (QnA.Count != 0)
        {
            currentQuestion = Random.Range(0, QnA.Count);

            QuestionTxt.text = QnA[currentQuestion].question;
            SetAnswers();
        } 
        else
        {
            LoaderUtility.Initialize();
            SceneManager.LoadScene("AR", LoadSceneMode.Single);
        }
    }

    List<QuestionAndAnswers> ReadQuizFromJSON(string filename)
    {
        string path = Path.Combine(Application.persistentDataPath, filename);
        if (File.Exists(path))
        {
            using (StreamReader reader = new StreamReader(path))
            {
                jsonContent = reader.ReadToEnd();
            }
        }

        if (string.IsNullOrEmpty(jsonContent) || jsonContent == "{}")
        {
            return null;
        }

        QuizResponse res = JsonConvert.DeserializeObject<QuizResponse>(jsonContent);
        return FilterQuiz(res.msg, PlayerPrefs.GetString("trackedimage"));
    }

    List<QuestionAndAnswers> FilterQuiz(List<QuestionAndAnswers> QnAList, string trackedImageName)
    {
        List<QuestionAndAnswers> filteredQuiz = (from QnA in QnAList
                                                 where QnA.asset.Replace(" ", "") == trackedImageName
                                                 select QnA).ToList();
        return filteredQuiz;
    }

    List<AssetData> ReadAssetsDataFromJSON(string filename)
    {
        string path = Path.Combine(Application.persistentDataPath, filename);
        if (File.Exists(path))
        {
            using (StreamReader reader = new StreamReader(path))
            {
                jsonContent = reader.ReadToEnd();
            }
        }

        if (string.IsNullOrEmpty(jsonContent) || jsonContent == "{}")
        {
            return null;
        }

        List<AssetData> res = JsonConvert.DeserializeObject<List<AssetData>>(jsonContent);
        return res;
    }

    List<AssetData> UpdateAsset(List<AssetData> AssetDataList, string trackedImageName)
    {
        foreach (AssetData assetData in AssetDataList)
        {
            if (assetData.name.Replace(" ", "") == trackedImageName)
            {
                assetData.quizCompleted = true;
            }
        }

        return AssetDataList;
    }

    AssetData GetAsset(List<AssetData> AssetDataList, string trackedImageName)
    {
        return AssetDataList.Find(x => x.name.Replace(" ", "") == trackedImageName);
    }

    private void WriteToFile(string filename, string data)
    {
        string path = Path.Combine(Application.persistentDataPath, filename);
        FileStream fileStream = new FileStream(path, FileMode.Create);

        using (StreamWriter writer = new StreamWriter(fileStream))
        {
            writer.Write(data);
        }
    }

}

public class QuizResponse
{
    public bool status;
    public string error;
    public List<QuestionAndAnswers> msg;
}

public class QuestionAndAnswers
{
    public string id;
    public string eventName;
    public string asset;
    public string eventID;
    public string assetID;
    public string question;
    public string option1;
    public string option2;
    public string option3;
    public string option4;
    public int answer;
    public int points;
    public bool visible;
}

public class UpdatePointsResponse
{
    public bool status;
    public string error;
    public string msg;
}
