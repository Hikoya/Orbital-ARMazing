using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;
using TMPro;
using System;
using System.IO;
using Newtonsoft.Json;
using UnityEngine.UI;

public class ARManager : MonoBehaviour
{
    private ARTrackedImageManager _trackedImageManager;
    private Dictionary<string, GameObject> _arUICanvases = new Dictionary<string, GameObject>();
    private string jsonContent = null;

    [SerializeField] private GameObject _arUICanvasPrefab;

    /**
     * Run once on scene start, forces screen orientation to lanscape, ensures
     * the mobile device never sleeps and get reference to trackedImageManager
     */
    private void Awake()
    {
        Screen.orientation = ScreenOrientation.LandscapeLeft;
        Screen.sleepTimeout = SleepTimeout.NeverSleep;

        _trackedImageManager = GetComponent<ARTrackedImageManager>();
        
        ShowTrackerInfo();
    }

    /**
     * On enable update number of tracked image changes
     */
    private void OnEnable()
    {
        _trackedImageManager.trackedImagesChanged += OnTrackedImagesChanged;
    }

    /**
     * On disable update number of tracked image changes
     */
    private void OnDisable()
    {
        _trackedImageManager.trackedImagesChanged -= OnTrackedImagesChanged;
    }

    /**
     * Get information about reference image library
     */
    public void ShowTrackerInfo()
    {
        var runtimeReferenceImageLibrary = _trackedImageManager.referenceLibrary as MutableRuntimeReferenceImageLibrary;
    }


    /**
     * Runs everytime there is a change tracked image state 
     * if the status is tracking enable AR UI overlay
     * else, disable AR UI overlay
     */
    void OnTrackedImagesChanged(ARTrackedImagesChangedEventArgs eventArgs)
    {
        foreach (ARTrackedImage trackedImage in eventArgs.added)
        {
            GameObject arUICanvas = Instantiate(_arUICanvasPrefab);
            _arUICanvases.Add(trackedImage.referenceImage.name, arUICanvas);
            UpdateARUI(trackedImage);
        }

        foreach (ARTrackedImage trackedImage in eventArgs.updated)
        {
            if (trackedImage.trackingState == TrackingState.Tracking)
            {
                UpdateARUI(trackedImage);
            }
            else
            {
                _arUICanvases[trackedImage.referenceImage.name].SetActive(false);
            }
        }
    }

    /**
     * Gets the correct AR UI overlay from the AR UIs list and updates the AR UI elements
     * 
     * @param trackedImage object that is currently scanned by the AR camera
     */
    void UpdateARUI(ARTrackedImage trackedImage)
    {
        GameObject arUICanvas = null;

        foreach (KeyValuePair<string, GameObject> canvas in _arUICanvases)
        {
            if (canvas.Key == trackedImage.referenceImage.name)
            {
                canvas.Value.SetActive(true);
                arUICanvas = canvas.Value;
            }
            else
            {
                canvas.Value.SetActive(false);
            }
        }

        GameObject arPanel = arUICanvas.transform.Find("Panel").gameObject;
        AssetData assetData = ReadAssetDataFromJSON("AssetData.txt", trackedImage.referenceImage.name);

        if (assetData.quizCompleted)
        {
            arPanel.transform.Find("QuizStatus_Text").gameObject.SetActive(true);
            GameObject[] quizButtons = GameObject.FindGameObjectsWithTag("Quiz");
            foreach (GameObject quizButton in quizButtons)
            {
                quizButton.GetComponent<Button>().interactable = false;
            }
        }
        else
        {
            GameObject[] quizButtons = GameObject.FindGameObjectsWithTag("Quiz");
            foreach (GameObject quizButton in quizButtons)
            {
                quizButton.GetComponent<Button>().interactable = true;
            }
        }

        

        TMP_Text titleText = arPanel.transform.Find("Title_Text").gameObject.GetComponent<TMP_Text>();
        titleText.text = assetData.name;
        PlayerPrefs.SetString("trackedimage", trackedImage.referenceImage.name);
        TMP_Text descText = arPanel.transform.Find("Desc_Text").gameObject.GetComponent<TMP_Text>();
        descText.text = assetData.description;
    }

    /**
     * Read and parse json string of the get asset (landmark) the JSON object list
     * is filtered and only the JSON object that matches the scanned landmark name is returned
     * 
     * @param filename string of the asset JSON data in persistent data path
     * @param assetName string the asset to find in object list
     * @return a filtered JSON object AssetData
     */
    AssetData ReadAssetDataFromJSON(string filename, string assetName)
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
        return FilterAsset(res, assetName);
    }

    /**
     * Get the Asset Data from the Asset Data list that matches the name of the image 
     * scanned by the AR
     * 
     * @param AssetDataList JSON object AssetData list to search
     * @param trackedImageName string name of the image scanned by the AR
     * @return a JSON object AssetData that matches the name of the image scanned by the AR
     */
    AssetData FilterAsset(List<AssetData> AssetDataList, string trackedImageName)
    {
        return AssetDataList.Find(x => x.name.Replace(" ", "") == trackedImageName);
    }

}
