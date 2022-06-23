using Newtonsoft.Json;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using System.Linq;
using TMPro;

public class LeaderboardManager : MonoBehaviour
{
    public Transform gridContent;
    public GameObject rowPrefab;
    public List<PlayerScores> playerScores;
    public string filename;
    // Start is called before the first frame update
    void Start()
    {
        UpdateLeaderboard();
    }

    public void UpdateLeaderboard()
    {
        filename = "testleaderboard.json";
        playerScores = ReadPlayerScoresFromJSON(filename);

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
        string content = ReadFile(GetPath(filename));
        Debug.Log(content);
        if (string.IsNullOrEmpty(content) || content == "{}")
        {
            return null;
        }

        LeaderboardJSONObj res = JsonConvert.DeserializeObject<LeaderboardJSONObj>(content);
        return res.msg.OrderByDescending(x => x.points).ToList();
    }

    string GetPath(string filename)
    {
        return "Assets/_PROJECT/Data/JSON/" + filename;
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
