using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class AnswerButtonBehaviour : MonoBehaviour
{
    public bool isCorrect = false;
    public QuizManager quizManager;
    private Image image;

    /**
     * Run once on scene start
     * Get reference to image component of button for color change
     */
    private void Start()
    {
        image = GetComponent<Image>();
    }

    /**
     * Called once any of the answer buttons are pressed and starts a coroutine to
     * update answer button GUI elements
     */
    public void Answer()
    {
        StartCoroutine(AnswerCoroutine());
    }

    /**
     * Updates answer button GUI elements, if correct answer button is 
     * pressed the button turns green, else it turns red. It will then 
     * call the next question method from the quiz manager to load the 
     * next set of question and answers.
     */
    IEnumerator AnswerCoroutine()
    {
        if (isCorrect)
        {
            quizManager.incrementPoints();
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
