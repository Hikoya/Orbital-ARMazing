using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;
using TMPro;
using System;
using Unity.Jobs;

public class ARManagerTest : MonoBehaviour
{
    private ARTrackedImageManager _trackedImageManager;
    private MutableRuntimeReferenceImageLibrary referenceImageLibrary;
    private Dictionary<string, GameObject> _arUICanvases = new Dictionary<string, GameObject>();

    [SerializeField] private GameObject _arUICanvasPrefab;
    //[SerializeField] private XRReferenceImageLibrary runtimeImageLibrary;
    [SerializeField] private TMP_Text debugLog;
    [SerializeField] private TMP_Text jobLog;
    [SerializeField] private TMP_Text currentImageText;

    public List<Texture2D> refImages;

    private void Awake()
    {
        Screen.orientation = ScreenOrientation.LandscapeLeft;
        Screen.sleepTimeout = SleepTimeout.NeverSleep;

        

        StartCoroutine(CreateDynamicReferenceLibrary());
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

        debugLog.text += $"TextureFormat.RGBA32 supported: {runtimeReferenceImageLibrary.IsTextureFormatSupported(TextureFormat.RGBA32)}\n";
        debugLog.text += $"Supported Texture Count ({runtimeReferenceImageLibrary.supportedTextureFormatCount})\n";
        debugLog.text += $"trackImageManager.trackables.count ({_trackedImageManager.trackables.count})\n";
        debugLog.text += $"trackImageManager.maxNumberOfMovingImages ({_trackedImageManager.requestedMaxNumberOfMovingImages})\n";
        debugLog.text += $"trackImageManager.supportsMutableLibrary ({_trackedImageManager.subsystem.subsystemDescriptor.supportsMutableLibrary})\n";
        debugLog.text += $"trackImageManager.requiresPhysicalImageDimensions ({_trackedImageManager.subsystem.subsystemDescriptor.requiresPhysicalImageDimensions})\n";
    }

    private IEnumerator CreateDynamicReferenceLibrary()
    {
        yield return new WaitForSeconds(5f);
        _trackedImageManager = gameObject.GetComponent<ARTrackedImageManager>();
        referenceImageLibrary = (MutableRuntimeReferenceImageLibrary)_trackedImageManager.CreateRuntimeLibrary();
        _trackedImageManager.enabled = false;
        var job = referenceImageLibrary.ScheduleAddImageWithValidationJob(refImages[0], refImages[0].name, 0.1f);
        job.jobHandle.Complete();
        if (referenceImageLibrary != null)
            _trackedImageManager.referenceLibrary = referenceImageLibrary;
        _trackedImageManager.requestedMaxNumberOfMovingImages = 5;
        _trackedImageManager.enabled = true;

        ShowTrackerInfo();
    }



    void OnTrackedImagesChanged(ARTrackedImagesChangedEventArgs eventArgs)
    {
        foreach (ARTrackedImage trackedImage in eventArgs.added)
        {
            GameObject arUICanvas = Instantiate(_arUICanvasPrefab);
            _arUICanvases.Add(trackedImage.referenceImage.name, arUICanvas);
            currentImageText.text = trackedImage.referenceImage.name;
            UpdateARUI(trackedImage);
        }

        foreach (ARTrackedImage trackedImage in eventArgs.updated)
        {
            currentImageText.text = trackedImage.referenceImage.name;
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
