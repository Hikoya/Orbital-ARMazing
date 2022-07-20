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

    private void Awake()
    {
        Screen.orientation = ScreenOrientation.LandscapeLeft;
        Screen.sleepTimeout = SleepTimeout.NeverSleep;

        _trackedImageManager = GetComponent<ARTrackedImageManager>();
        
        ShowTrackerInfo();
    }
    private void OnEnable()
    {
        _trackedImageManager.trackedImagesChanged += OnTrackedImagesChanged;
    }

    private void OnDisable()
    {
        _trackedImageManager.trackedImagesChanged -= OnTrackedImagesChanged;
    }

    public void ShowTrackerInfo()
    {
        var runtimeReferenceImageLibrary = _trackedImageManager.referenceLibrary as MutableRuntimeReferenceImageLibrary;
    }


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
        AssetData assetData = ReadAssetDataFromJSON("AssetData.txt", trackedImage.referenceImage.name);
        if (assetData.quizCompleted)
        {
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

        GameObject arPanel = arUICanvas.transform.Find("Panel").gameObject;

        TMP_Text titleText = arPanel.transform.Find("Title_Text").gameObject.GetComponent<TMP_Text>();
        titleText.text = assetData.name;
        PlayerPrefs.SetString("trackedimage", trackedImage.referenceImage.name);
        TMP_Text descText = arPanel.transform.Find("Desc_Text").gameObject.GetComponent<TMP_Text>();
        descText.text = assetData.description;
    }

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

    AssetData FilterAsset(List<AssetData> AssetDataList, string trackedImageName)
    {
        return AssetDataList.Find(x => x.name.Replace(" ", "") == trackedImageName);
    }

}
