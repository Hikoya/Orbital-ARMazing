using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using UnityEngine.XR.ARFoundation;
using TMPro;

public class QuizButtonBehaviour : MonoBehaviour
{
    /**
     * Called once the quiz button is pressed and loads the Quiz scene
     */
    public void QuizButton()
    {
        SceneManager.LoadScene("Quiz", LoadSceneMode.Single);
        LoaderUtility.Deinitialize();
    }
}
