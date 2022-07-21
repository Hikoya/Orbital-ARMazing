using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.XR.ARFoundation;
using TMPro;
using UnityEngine.Networking;
using Newtonsoft.Json;
using System.IO;
using System;

public class JoinEventManager : MonoBehaviour
{
    public GameObject messageBox;
    public TMP_InputField nicknameInput;
    public TMP_InputField eventNameInput;
    private TMP_Text messageText;
    private string auth = "Bearer passwordispasswordissecret";
    private string eventCode = null;
    private string nickname = null;
    private string eventId = null;
    private string eventName = null;

    private void Start()
    {
        Screen.orientation = ScreenOrientation.Portrait;
        messageText = messageBox.GetComponentInChildren<TMP_Text>();
    }
    public void JoinEventButton()
    {
        eventCode = eventNameInput.text;
        nickname = nicknameInput.text;
        StartCoroutine(JoinEventPost()); 
    }

    IEnumerator JoinEventPost()
    {
        messageBox.SetActive(true);
        messageText.text = "Joining Event... Loading...";
        string uri = "https://orbital-armazing.herokuapp.com/api/unity/join";
        WWWForm form = new WWWForm();
        form.AddField("eventID", eventCode);
        form.AddField("username", nickname);
        using (UnityWebRequest request = UnityWebRequest.Post(uri, form))
        {
            request.SetRequestHeader("Authorization", auth);
            yield return request.SendWebRequest();
            if (request.isNetworkError || request.isHttpError)
            {
                messageText.text = request.error;
            }
            else
            {
                JoinEventResponse response = GetEventJoinResponse(request.downloadHandler.text);

                if (response.status)
                {
                    Debug.Log(response.msg);
                    eventId = response.msg.eventID;
                    eventName = response.msg.eventName;
                    PlayerPrefs.SetString("nickname", nickname);
                    PlayerPrefs.SetString("eventid", eventId);
                    PlayerPrefs.SetString("eventname", eventName);
                    PlayerPrefs.SetString("eventcode", eventCode);
                    StartCoroutine(FetchAndSaveQuizJson());
                }
                else messageText.text = response.error;
            }
        }
    }

    public JoinEventResponse GetEventJoinResponse(string jsonString)
    {
        if (string.IsNullOrEmpty(jsonString) || jsonString == "{}")
        {
            return null;
        }

        JoinEventResponse res = JsonConvert.DeserializeObject<JoinEventResponse>(jsonString);
        return res;
    }

    IEnumerator FetchAndSaveQuizJson()
    {
        messageText.text = "Downloading quiz... Loading...";
        string uri = "https://orbital-armazing.herokuapp.com/api/unity/quiz";
        WWWForm form = new WWWForm();
        form.AddField("eventID", eventId);
        using (UnityWebRequest request = UnityWebRequest.Post(uri, form))
        {
            request.SetRequestHeader("Authorization", auth);
            yield return request.SendWebRequest();
            if (request.isNetworkError || request.isHttpError)
            {
                messageText.text = request.error;
            }
            else
            {
                QuizResponse response = GetQuizDataResponse(request.downloadHandler.text);

                if (response.status)
                {
                    WriteToFile(eventId.Replace(" ", "") + ".txt", request.downloadHandler.text);
                    StartCoroutine(FetchAndSaveAssetImages());
                }
                else messageText.text = response.error;
            }
        }
    }

    public QuizResponse GetQuizDataResponse(string jsonContent)
    {
        if (string.IsNullOrEmpty(jsonContent) || jsonContent == "{}")
        {
            return null;
        }
        QuizResponse res = JsonConvert.DeserializeObject<QuizResponse>(jsonContent);
        return res;
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

    IEnumerator FetchAndSaveAssetImages()
    {
        messageText.text = "Downloading images... Loading...";
        string uri = "https://orbital-armazing.herokuapp.com/api/unity/landmark";
        WWWForm form = new WWWForm();
        form.AddField("eventID", eventId);
        using (UnityWebRequest request = UnityWebRequest.Post(uri, form))
        {
            request.SetRequestHeader("Authorization", auth);
            yield return request.SendWebRequest();
            if (request.isNetworkError || request.isHttpError)
            {
                messageText.text = request.error;
            }
            else
            {
                AssetResponse response = GetAssetResponse(request.downloadHandler.text);
                if (response.status)
                { 
                    WriteToFile("AssetData.txt", JsonConvert.SerializeObject(response.msg));
                    foreach (AssetData assetData in response.msg)
                    {
                        yield return StartCoroutine(DownloadAndSaveImage(assetData.imagePath, assetData.name.Replace(" ","") + ".JPG"));
                    }
                    LoaderUtility.Initialize();
                    SceneManager.LoadScene("AR", LoadSceneMode.Single);
                }
                else messageText.text = response.error;
            }
        }
    }

    IEnumerator DownloadAndSaveImage(string url, string filename)
    {
        Debug.Log(url);
        using (UnityWebRequest uwr = UnityWebRequestTexture.GetTexture(url))
        {
            yield return uwr.SendWebRequest();

            if (uwr.isNetworkError || uwr.isHttpError)
            {
                Debug.Log(uwr.error);
            }
            else
            {
                Debug.Log("Success");
                Texture myTexture = DownloadHandlerTexture.GetContent(uwr);
                byte[] results = uwr.downloadHandler.data;
                yield return StartCoroutine(SaveImage(filename, results));
            }
        }
    }

    public AssetResponse GetAssetResponse(string jsonContent)
    {
        if (string.IsNullOrEmpty(jsonContent) || jsonContent == "{}")
        {
            return null;
        }
        AssetResponse res = JsonConvert.DeserializeObject<AssetResponse>(jsonContent);
        return res;
    }

    IEnumerator SaveImage(string filename, byte[] imageBytes)
    {
        string path = Path.Combine(Application.persistentDataPath, filename);
        File.WriteAllBytes(path, imageBytes);
        yield return new WaitUntil(() => File.Exists(path));
        Debug.Log("Saved Data to: " + path.Replace("/", "\\"));
    } 
}

public class JoinEventResponse
{
    public bool status;
    public string error;
    public JoinEventMsg msg;
}

public class JoinEventMsg
{
    public string eventID;
    public string eventName;
}