using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.XR.ARFoundation;

public class BackButtonBehaviour : MonoBehaviour
{
    public void BackButton()
    {
        LoaderUtility.Initialize();
        SceneManager.LoadScene("AR", LoadSceneMode.Single);
    }

}
