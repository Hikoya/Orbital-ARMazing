using System.Collections;
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
    private string eventName = null;

    /**
     * Run once on scene start, forces screen orientation to portrait and
     * get reference to message text which displays log of event joining progress
     */
    private void Start()
    {
        Screen.orientation = ScreenOrientation.Portrait;
        messageText = messageBox.GetComponentInChildren<TMP_Text>();
    }

    /**
     * A public method linked to the Join Event Button of the GUI.
     * This method will be called once the Join Event Button is clicked.
     * It gets the data from the text input fields of the GUI and
     * start the joining event sequence
     */
    public void JoinEventButton()
    {
        eventCode = eventNameInput.text;
        nickname = nicknameInput.text;
        StartCoroutine(JoinEventPost()); 
    }

    /**
     * First coroutine in the joining event sequence 
     * 1. Remove previous event's asset data if it exist
     * 2. Calls join event API using HTTP Post with relavent data
     * 3. Upon getting success response it will call the second coroutine of join event sequence
     */
    IEnumerator JoinEventPost()
    {
        DeletePreviousData();
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

    /**
     * Deletes previous event data in presistant data path
     */
    void DeletePreviousData()
    {
        string[] filePaths = Directory.GetFiles(Application.persistentDataPath);
        foreach (string filePath in filePaths) File.Delete(filePath);
    }

    /**
     * Parse json string of the join event API response and return it as a
     * JSON object
     * 
     * @param jsonContent string response from join event API call
     * @return a parsed JSON object JoinEventResponse
     */
    public JoinEventResponse GetEventJoinResponse(string jsonContent)
    {
        if (string.IsNullOrEmpty(jsonContent) || jsonContent == "{}")
        {
            return null;
        }

        JoinEventResponse res = JsonConvert.DeserializeObject<JoinEventResponse>(jsonContent);
        return res;
    }

    /**
     * Second coroutine in the joining event sequence 
     * 1. Calls get quiz data API using HTTP Post with relavent data
     * 2. Upon getting success response, saves quiz data to persistant data path as a text file
     * 3. It then call the third coroutine of join event sequence
     */
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

    /**
     * Parse json string of the get quiz data API response and return it as a
     * JSON object
     * 
     * @param jsonContent string response from get quiz data API call
     * @return a parsed JSON object QuizResponse
     */
    public QuizResponse GetQuizDataResponse(string jsonContent)
    {
        if (string.IsNullOrEmpty(jsonContent) || jsonContent == "{}")
        {
            return null;
        }
        QuizResponse res = JsonConvert.DeserializeObject<QuizResponse>(jsonContent);
        return res;
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

    /**
     * Third coroutine in the joining event sequence 
     * 1. Calls get get landmarks API using HTTP Post with relavent data
     * 2. Upon getting success response, saves landmark data (JSON) and landmark images (JPG)
     * to persistant data path
     * 3. It then loads the next scene, AR scene
     */
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

    /**
     * Get image url path from landmarks JSON data
     * Download image and saves it in persistent file path with specified filename
     * 
     * @param url string of the image saved on AWS S3 bucket
     * @param filename string that specify the name of the image file to be saved
     */
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

    /**
    * Parse json string of the get landmark data API response and return it as a
    * JSON object
    * 
    * @param jsonContent string response from get landmark data API call
    * @return a parsed JSON object AssetResponse
    */
    public AssetResponse GetAssetResponse(string jsonContent)
    {
        if (string.IsNullOrEmpty(jsonContent) || jsonContent == "{}")
        {
            return null;
        }
        AssetResponse res = JsonConvert.DeserializeObject<AssetResponse>(jsonContent);
        return res;
    }

    /**
     * Writes image byte array data into persistent data path with specified filename
     * 
     * @param filename string that specify the name of the image file to be saved
     * @param imagesBytes byte array data of the downloaded image file
     */
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