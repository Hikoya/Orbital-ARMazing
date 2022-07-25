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
    public TMP_Text QuizTitle;

    /**
     * Run once on scene start
     * 1. Gets event id stored in PlayerPref
     * 2. Read, filter and get quiz data according to scanned image
     * 3. Generate questions from filter quiz data and update GUI
     */
    private void Start()
    {
        filename = PlayerPrefs.GetString("eventid") + ".txt";
        QnA = ReadQuizFromJSON(filename);
        GenerateQuestion();
    }

    /**
     * Called once a answer button is pressed
     * Removes currently shown question from QnA list 
     * if there are still more question left in the QnA List
     * move on to the next question and display on GUI
     * else update asset data JSON to indicate quiz has been attempted
     * call update points API and load back AR scene
     */
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

    /** 
     * 1. Calls update points API using HTTP Post with relavent data
     * 2. Upon getting success response, load back AR scene
     */
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

    /**
     * Parse json string of the update points API response and return it as a
     * JSON object
     * 
     * @param jsonContent string response from get update points API call
     * @return a parsed JSON object UpdatePointsResponse
     */
    public UpdatePointsResponse GetUpdatePointsResponse(string jsonContent)
    {
        if (string.IsNullOrEmpty(jsonContent) || jsonContent == "{}")
        {
            return null;
        }

        UpdatePointsResponse res = JsonConvert.DeserializeObject<UpdatePointsResponse>(jsonContent);
        return res;
    }

    /**
     * Set all answer buttons as non iteractable
     */
    public void DisableOptions()
    {
        for (int i = 0; i < options.Length; i++)
        {
            options[i].GetComponent<Button>().interactable = false;
        }
    }

    /**
     * Set all answer buttons as iteractable
     */
    public void EnableOptions()
    {
        for (int i = 0; i < options.Length; i++)
        {
            options[i].GetComponent<Button>().interactable = true;
        }
    }

    /**
     * Update answer button texts of the quiz scene
     */
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

    /**
     * Increments points of the current quiz session
     */
    public void incrementPoints()
    {
        points += currentPoint;
    }

    /**
     * Randomly get a question from the QnA list and update GUI elements of quiz scene
     * if there are no questions in QnA return back to AR scene 
     */
    void GenerateQuestion()
    {
        if (QnA.Count != 0)
        {
            currentQuestion = Random.Range(0, QnA.Count);

            QuestionTxt.text = QnA[currentQuestion].question;
            QuizTitle.text = QnA[currentQuestion].asset;
            SetAnswers();
        } 
        else
        {
            LoaderUtility.Initialize();
            SceneManager.LoadScene("AR", LoadSceneMode.Single);
        }
    }

    /**
     * Read and parse JSON string of the quiz data and return it as a
     * JSON object list
     * 
     * @param filename string of the quiz JSON data in persistent data path
     * @return a parsed JSON object QuestionAndAnswers list
     */
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

    /**
     * Filter JSON object QuestionAndAnswers list according to the scanned image by the AR
     * 
     * @param QnAList JSON object QuestionAndAnswers list to be filtered
     * @param trackedImageName string name of the scanned iamge by the AR
     * @return a filtered JSON object QuestionAndAnswers list 
     */
    List<QuestionAndAnswers> FilterQuiz(List<QuestionAndAnswers> QnAList, string trackedImageName)
    {
        List<QuestionAndAnswers> filteredQuiz = (from QnA in QnAList
                                                 where QnA.asset.Replace(" ", "") == trackedImageName
                                                 select QnA).ToList();
        return filteredQuiz;
    }

    /**
     * Read and parse json string of the get asset (landmark) and return it as a
     * JSON object list
     * 
     * @param filename string of the asset JSON data in persistent data path
     * @return a parsed JSON object AssetData list
     */
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

    /**
     * Update the Asset Data list by setting the quiz completed status to true of the 
     * scanned image by the AR
     * 
     * @param AssetDataList JSON object AssetData list to be updated
     * @param trackedImageName string name of the image scanned by the AR
     * @return a updated JSON object AssetData list
     */
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

    /**
     * Get the Asset Data from the Asset Data list that matches the name of the image 
     * scanned by the AR
     * 
     * @param AssetDataList JSON object AssetData list to search
     * @param trackedImageName string name of the image scanned by the AR
     * @return a JSON object AssetData that matches the name of the image scanned by the AR
     */
    AssetData GetAsset(List<AssetData> AssetDataList, string trackedImageName)
    {
        return AssetDataList.Find(x => x.name.Replace(" ", "") == trackedImageName);
    }

    /**
     * Writes string data into persistent data path with specified filename
     * 
     * @param filename string that specify the name of the file to be saved
     * @param data string to be written and saved as a text file
     */
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
