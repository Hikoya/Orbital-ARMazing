using Newtonsoft.Json;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using System.Linq;
using TMPro;
using UnityEngine.Networking;

public class LeaderboardManager : MonoBehaviour
{
    public GameObject messageBox;
    public GameObject informationPanel;
    public Transform gridContent;
    public GameObject rowPrefab;
    public List<PlayerScores> playerScores;
    private TMP_Text messageText;
    public string filename;
    private string auth = "Bearer passwordispasswordissecret";

    /**
     * Run once on scene start
     * 1. Update Information panel
     * 2. Start fetching player ranking by calling leaderboard API
     */
    void Start()
    {
        messageText = messageBox.GetComponentInChildren<TMP_Text>();

        //For testing
        //PlayerPrefs.SetString("eventid", "cl4vdb84g00830m1yk5v2143l");
        //PlayerPrefs.SetString("eventname", "testingname");
        //PlayerPrefs.SetString("eventcode", "testingcode");

        UpdateInformationPanel();
        StartCoroutine(FetchLeaderboardJson());
    }

    /**
     * Update information panel with the event name and event code
     */
    void UpdateInformationPanel()
    {
        informationPanel.transform.Find("EventNameText").GetComponent<TMP_Text>().text = "Event Name: " + PlayerPrefs.GetString("eventname");
        informationPanel.transform.Find("EventCodeText").GetComponent<TMP_Text>().text = "Event Code: " + PlayerPrefs.GetString("eventcode");
    }

    /** 
     * 1. Calls leader board API using HTTP Post with relavent data
     * 2. Upon getting success response, update the leaderboard 
     * GUI with the returned response
     */
    IEnumerator FetchLeaderboardJson()
    {
        messageBox.SetActive(true);
        messageText.text = "Fetching leaderboard data... Loading...";
        string uri = "https://orbital-armazing.herokuapp.com/api/unity/leaderboard";
        WWWForm form = new WWWForm();
        form.AddField("eventID", PlayerPrefs.GetString("eventid"));
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
                LeaderboardResponse response = GetLeaderboardDataResponse(request.downloadHandler.text);
                Debug.Log(response.msg);
                
                if (response.status)
                {
                    playerScores = response.msg.OrderByDescending(x => x.points).ToList();
                    UpdateLeaderboard();
                    messageBox.SetActive(false);
                }
                else messageText.text = response.error;
            }
        }
    }

    /**
     * Parse json string of the leaderboard API response and return it as a
     * JSON object
     * 
     * @param jsonContent string response from leaderboard API call
     * @return a parsed JSON object LeaderboardResponse
     */
    public LeaderboardResponse GetLeaderboardDataResponse(string jsonContent)
    {
        if (string.IsNullOrEmpty(jsonContent) || jsonContent == "{}")
        {
            return null;
        }
        LeaderboardResponse res = JsonConvert.DeserializeObject<LeaderboardResponse>(jsonContent);
        return res;
    }

    /** 
      * Update GUI elements of the player ranking panel, shows top 10 player ranking sorted in 
      * descending order 
      */
    void UpdateLeaderboard()
    {
        for (int i = 0; i < playerScores.Count; i++)
        {
            if (i >= 10) break;

            int rank = i + 1;
            GameObject row = Instantiate(rowPrefab, gridContent);
            row.transform.parent = gridContent;

            row.transform.Find("RankingText").GetComponent<TMP_Text>().text = rank.ToString();
            row.transform.Find("TeamNameText").GetComponent<TMP_Text>().text = playerScores.ElementAt(i).username;
            row.transform.Find("PointsText").GetComponent<TMP_Text>().text = playerScores.ElementAt(i).points.ToString();
        }
    }
}

public class LeaderboardResponse
{
    public bool status;
    public string error;
    public List<PlayerScores> msg;
}

public class PlayerScores
{
    public string id;
    public string eventID;
    public string eventName;
    public int points;
    public string username;
}
