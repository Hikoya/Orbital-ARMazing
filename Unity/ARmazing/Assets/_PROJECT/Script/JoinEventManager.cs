using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.XR.ARFoundation;
using TMPro;
using UnityEngine.Networking;
using Newtonsoft.Json;
using System.IO;

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


    private void Start()
    {
        Screen.orientation = ScreenOrientation.Portrait;
        messageText = messageBox.GetComponentInChildren<TMP_Text>();
    }
    public void JoinEventButton()
    {
        //Milestone 2: call backend API to join event (if active) and download necessary event assets
        eventCode = eventNameInput.text;
        nickname = nicknameInput.text;
        StartCoroutine(JoinEventPost());
    }

    IEnumerator JoinEventPost()
    {
        messageBox.SetActive(true);
        messageText.text = "Loading...";
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
                    eventId = response.msg;
                    PlayerPrefs.SetString("nickname", nickname);
                    PlayerPrefs.SetString("eventid", eventId);
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
                    WriteToFile(eventId + ".txt", request.downloadHandler.text);
                    LoaderUtility.Initialize();
                    SceneManager.LoadScene("AR", LoadSceneMode.Single);
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
        string path = Application.persistentDataPath + filename;
        FileStream fileStream = new FileStream(path, FileMode.Create);

        using (StreamWriter writer = new StreamWriter(fileStream))
        {
            writer.Write(data);
        }
    }
}

public class JoinEventResponse
{
    public bool status;
    public string error;
    public string msg;
}