using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.XR.ARFoundation;

public class BackButtonBehaviour : MonoBehaviour
{
    /**
     * Called once the back button is pressed and loads the AR scene
     */
    public void BackButton()
    {
        LoaderUtility.Initialize();
        SceneManager.LoadScene("AR", LoadSceneMode.Single);
    }

}
