using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;
using TMPro;

[RequireComponent (typeof (ARTrackedImageManager))]

public class ARManager : MonoBehaviour
{
    private ARTrackedImageManager _trackedImageManager;

    [SerializeField] private GameObject _arUICanvas;
    [SerializeField] private TMP_Text tileText;
    [SerializeField] private TMP_Text descText;

    private void Awake()
    {
        Screen.sleepTimeout = SleepTimeout.NeverSleep;
        _trackedImageManager = GetComponent<ARTrackedImageManager>();
        _arUICanvas.SetActive(false);
    }

    private void OnEnable()
    {
        _trackedImageManager.trackedImagesChanged += OnTrackedImagesChanged;
    }

    private void OnDisable()
    {
        _trackedImageManager.trackedImagesChanged -= OnTrackedImagesChanged;
    }

    void OnTrackedImagesChanged(ARTrackedImagesChangedEventArgs eventArgs)
    {
        foreach(ARTrackedImage trackedImage in eventArgs.added)
        {
            trackedImage.destroyOnRemoval = false;
        }

        foreach(ARTrackedImage trackedImage in eventArgs.updated)
        {
            if (trackedImage.trackingState == TrackingState.Tracking)
            {
                UpdateARUI(trackedImage);
            } 
            else
            {
                _arUICanvas.SetActive(false);
            }
        }
    }

    void UpdateARUI(ARTrackedImage trackedImage)
    {
        _arUICanvas.SetActive(true);
        tileText.text = trackedImage.referenceImage.name;
        descText.text = "Description of " + trackedImage.referenceImage.name;
    }
}
