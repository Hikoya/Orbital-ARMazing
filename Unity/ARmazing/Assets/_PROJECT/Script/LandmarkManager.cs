using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using TMPro;
using UnityEngine.UI;

public class LandmarkManager : MonoBehaviour
{
    public GameObject messageBox;
    public GameObject informationPanel;
    public Transform gridContent;
    public GameObject rowPrefab;
    private List<AssetData> assetsData;
    private TMP_Text messageText;
    private string jsonContent = null;

    // Start is called before the first frame update
    void Start()
    {
        messageText = messageBox.GetComponentInChildren<TMP_Text>();
        assetsData = ReadAssetsDataFromJSON("AssetData.txt");

        //For testing
        //PlayerPrefs.SetString("eventname", "testingname");
        //PlayerPrefs.SetString("eventcode", "testingcode");

        UpdateLandmarks();
        UpdateInformationPanel();
    }

    void UpdateInformationPanel()
    {
        informationPanel.transform.Find("EventNameText").GetComponent<TMP_Text>().text = "Event Name: " + PlayerPrefs.GetString("eventname");
        informationPanel.transform.Find("EventCodeText").GetComponent<TMP_Text>().text = "Event Code: " + PlayerPrefs.GetString("eventcode");
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

    void UpdateLandmarks()
    {
        foreach (AssetData assetData in assetsData)
        {
            GameObject row = Instantiate(rowPrefab, gridContent);
            row.transform.parent = gridContent;

            row.transform.Find("LandmarkNameText").GetComponent<TMP_Text>().text = "Name: " + assetData.name;
            row.transform.Find("QuizStatusText").GetComponent<TMP_Text>().text = "Quiz Status: " + (assetData.quizCompleted ? "Completed" : "Not Completed");
            row.transform.Find("LatitudeText").GetComponent<TMP_Text>().text = "Latitude: " + assetData.latitude;
            row.transform.Find("LongitudeText").GetComponent<TMP_Text>().text = "Longitude: " + assetData.longitude;
            
            row.transform.Find("LandmarkImage").GetComponent<Image>().sprite = LoadPNG(assetData.name.Replace(" ", "") + ".JPG");
        }
    }

    Sprite LoadPNG(string filePath)
    {

        Texture2D tex = null;
        byte[] fileData;
        filePath = Path.Combine(Application.persistentDataPath, filePath);
        Debug.Log(filePath);

        if (File.Exists(filePath))
        {

            fileData = File.ReadAllBytes(filePath);
            tex = new Texture2D(2, 2, TextureFormat.RGBA32, false);
            tex.LoadImage(fileData); //..this will auto-resize the texture dimensions.
        }
        return Sprite.Create(tex, new Rect(0, 0, tex.width, tex.height), new Vector2(0.5f, 0.5f));
    }
}