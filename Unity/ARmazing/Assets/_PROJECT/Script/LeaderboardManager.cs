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
    public Transform gridContent;
    public GameObject rowPrefab;
    public List<PlayerScores> playerScores;
    public string filename;
    private string jsonContent;
    // Start is called before the first frame update
    void Start()
    {
        UpdateLeaderboard();
    }

    public void UpdateLeaderboard()
    {
        filename = "testleaderboard.json";
        if (Application.platform == RuntimePlatform.Android)
        {
            StartCoroutine(ReadPlayerScoresFromJSONAndroid(filename));
        } else
        {
            playerScores = ReadPlayerScoresFromJSON(filename);

            PopulateRanking();
        }
       
    }

    void PopulateRanking()
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

    List<PlayerScores> ReadPlayerScoresFromJSON(string filename)
    {
        jsonContent = ReadFile(GetPath(filename));

        if (string.IsNullOrEmpty(jsonContent) || jsonContent == "{}")
        {
            return null;
        }

        LeaderboardJSONObj res = JsonConvert.DeserializeObject<LeaderboardJSONObj>(jsonContent);
        return res.msg.OrderByDescending(x => x.points).ToList();
    }

    string GetPath(string filename)
    {
        if (Application.platform == RuntimePlatform.IPhonePlayer) return Application.dataPath + "/Raw" + filename;
        else return Application.dataPath + "/StreamingAssets/" + filename;
    }

    IEnumerator ReadPlayerScoresFromJSONAndroid(string filename)
    {
        string filePath = "jar:file://" + Application.dataPath + "!/assets/" + filename;
        using (UnityWebRequest request = UnityWebRequest.Get(filePath))
        {
            yield return request.SendWebRequest();
            if (request.isNetworkError || request.isHttpError)
            {
                Debug.Log(request.error);
            }
            else
            {
                jsonContent = request.downloadHandler.text;
                if (!string.IsNullOrEmpty(jsonContent) && !(jsonContent == "{}"))
                {
                    LeaderboardJSONObj res = JsonConvert.DeserializeObject<LeaderboardJSONObj>(jsonContent);
                    playerScores = res.msg;
                    PopulateRanking();
                }

            }
        }
    }

    string ReadFile(string path)
    {
        if (File.Exists(path))
        {
            using (StreamReader reader = new StreamReader(path))
            {
                string content = reader.ReadToEnd();
                return content;
            }
        }
        return "";
    }

}

public class LeaderboardJSONObj
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
