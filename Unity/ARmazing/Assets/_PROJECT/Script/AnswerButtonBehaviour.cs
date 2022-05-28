using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class AnswerButtonBehaviour : MonoBehaviour
{
    public bool isCorrect = false;
    public QuizManager quizManager;
    private Image image;

    private void Start()
    {
        image = GetComponent<Image>();
    }

    public void Answer()
    {
        StartCoroutine(AnswerCoroutine());
    }

    IEnumerator AnswerCoroutine()
    {
        if (isCorrect)
        {
            image.color = new Color32(70, 204, 28, 255);
            Debug.Log("Correct");
        }
        else
        {
            image.color = new Color32(197, 5, 5, 255);
            Debug.Log("Wrong");
        }
        quizManager.DisableOptions();
        yield return new WaitForSeconds(2);
        image.color = new Color32(48, 48, 48, 255);
        quizManager.NextQuestion();
    }


}
