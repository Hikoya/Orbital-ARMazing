using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;
using TMPro;
using System;

public class ARManager : MonoBehaviour
{
    private ARTrackedImageManager _trackedImageManager;
    private Dictionary<string, GameObject> _arUICanvases = new Dictionary<string, GameObject>();

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

        GameObject arPanel = arUICanvas.transform.Find("Panel").gameObject;

        TMP_Text titleText = arPanel.transform.Find("Title_Text").gameObject.GetComponent<TMP_Text>();
        titleText.text = trackedImage.referenceImage.name;
        TMP_Text descText = arPanel.transform.Find("Desc_Text").gameObject.GetComponent<TMP_Text>();
        descText.text = "Description of " + trackedImage.referenceImage.name;
    }

}
