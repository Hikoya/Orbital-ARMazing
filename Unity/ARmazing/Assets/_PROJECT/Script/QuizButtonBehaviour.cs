using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class QuizButtonBehaviour : MonoBehaviour
{
    public void QuizButton()
    {
        SceneManager.LoadScene("Quiz");
    }
}
