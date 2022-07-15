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
    public Transform gridContent;
    public GameObject rowPrefab;
    public List<PlayerScores> playerScores;
    private TMP_Text messageText;
    public string filename;
    private string jsonContent;
    private string auth = "Bearer passwordispasswordissecret";
    
    // Start is called before the first frame update
    void Start()
    {
        messageText = messageBox.GetComponentInChildren<TMP_Text>();
        //For testing
        //PlayerPrefs.SetString("eventid", "cl4vdb84g00830m1yk5v2143l");
        StartCoroutine(FetchLeaderboardJson());
    }

    IEnumerator FetchLeaderboardJson()
    {
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
                }
                else messageText.text = response.error;
            }
        }
    }

    public LeaderboardResponse GetLeaderboardDataResponse(string jsonContent)
    {
        if (string.IsNullOrEmpty(jsonContent) || jsonContent == "{}")
        {
            return null;
        }
        LeaderboardResponse res = JsonConvert.DeserializeObject<LeaderboardResponse>(jsonContent);
        return res;
    }

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
