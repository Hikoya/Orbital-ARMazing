using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.XR.ARFoundation;

public class JoinEventManager : MonoBehaviour
{
    private void Start()
    {
        Screen.orientation = ScreenOrientation.Portrait;
    }
    public void JoinEventButton()
    {
        //Milestone 2: call backend API to join event (if active) and download necessary event assets
        LoaderUtility.Initialize();
        SceneManager.LoadScene("AR", LoadSceneMode.Single);
    }
}
