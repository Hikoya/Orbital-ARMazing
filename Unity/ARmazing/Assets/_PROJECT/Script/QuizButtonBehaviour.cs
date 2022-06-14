using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using UnityEngine.XR.ARFoundation;

public class QuizButtonBehaviour : MonoBehaviour
{
    public void QuizButton()
    {
        SceneManager.LoadScene("Quiz", LoadSceneMode.Single);
        LoaderUtility.Deinitialize();
    }
}
