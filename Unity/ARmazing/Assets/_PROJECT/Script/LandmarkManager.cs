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

    /**
     * Run once on scene start
     * 1. Read asset (landmark) data from persistent data path
     * 2. Update information panel and landmarks panel
     */
    void Start()
    {
        messageText = messageBox.GetComponentInChildren<TMP_Text>();
        assetsData = ReadAssetsDataFromJSON("AssetData.txt");

        //For testing
        //PlayerPrefs.SetString("eventname", "testingname");
        //PlayerPrefs.SetString("eventcode", "testingcode");
        
        UpdateInformationPanel();
        UpdateLandmarks();
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
     * Update landmark panel with the landmark cards filled with the data read from asset JSON data
     */
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
            
            row.transform.Find("LandmarkImage").GetComponent<Image>().sprite = LoadImage(assetData.name.Replace(" ", "") + ".JPG");
        }
    }

    /**
     * Loads image data, byte array, from specified file path and return a image sprite 
     * 
     * @param filePath string of the image location in local storage
     * @return a Sprite of the loaded image
     */
    Sprite LoadImage(string filePath)
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