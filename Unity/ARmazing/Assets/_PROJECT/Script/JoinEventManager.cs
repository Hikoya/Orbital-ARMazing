using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.XR.ARFoundation;
using TMPro;
using UnityEngine.Networking;
using Newtonsoft.Json;

public class JoinEventManager : MonoBehaviour
{
    public GameObject messageBox;
    public TMP_InputField nicknameInput;
    public TMP_InputField eventNameInput;
    private TMP_Text messageText;
    private string auth = "Bearer passwordispasswordissecret";
    private string eventID = null;
    private string nickname = null;


    private void Start()
    {
        Screen.orientation = ScreenOrientation.Portrait;
        messageText = messageBox.GetComponentInChildren<TMP_Text>();
    }
    public void JoinEventButton()
    {
        //Milestone 2: call backend API to join event (if active) and download necessary event assets
        eventID = eventNameInput.text;
        nickname = nicknameInput.text;
        StartCoroutine(JoinEventPost());
    }

    IEnumerator JoinEventPost()
    {
        messageBox.SetActive(true);
        messageText.text = "Loading...";
        string uri = "https://orbital-armazing.herokuapp.com/api/unity/join";
        WWWForm form = new WWWForm();
        form.AddField("eventID", eventID);
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
                    messageText.text = response.msg;
                    LoaderUtility.Initialize();
                    SceneManager.LoadScene("AR", LoadSceneMode.Single);
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
}


public class JoinEventResponse
{
    public bool status;
    public string error;
    public string msg;
}
