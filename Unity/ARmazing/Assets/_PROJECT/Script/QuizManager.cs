using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using UnityEngine.XR.ARFoundation;

public class QuizManager : MonoBehaviour
{
    public List<QuestionAndAnswers> QnA;
    public GameObject[] options;
    public int currentQuestion;

    public TMP_Text QuestionTxt;

    private void Start()
    {
        GenerateQuestion();
    }

    public void NextQuestion()
    {
        QnA.RemoveAt(currentQuestion);
        if (QnA.Count <= 0)
        {
            LoaderUtility.Initialize();
            SceneManager.LoadScene("AR", LoadSceneMode.Single);
        }
        GenerateQuestion();
        EnableOptions();
    }

    public void DisableOptions()
    {
        for (int i = 0; i < options.Length; i++)
        {
            options[i].GetComponent<Button>().interactable = false;
        }
    }

    public void EnableOptions()
    {
        for (int i = 0; i < options.Length; i++)
        {
            options[i].GetComponent<Button>().interactable = true;
        }
    }

    void SetAnswers()
    {
        for (int i = 0; i < options.Length; i++)
        {
            options[i].GetComponent<AnswerButtonBehaviour>().isCorrect = false;
            options[i].transform.GetChild(0).GetComponent<TMP_Text>().text = QnA[currentQuestion].Answers[i];

            if(QnA[currentQuestion].CorrectAnswer == i + 1)
            {
                options[i].GetComponent<AnswerButtonBehaviour>().isCorrect = true;
            }
        }
    }

    void GenerateQuestion()
    {
        currentQuestion = Random.Range(0, QnA.Count);

        QuestionTxt.text = QnA[currentQuestion].Question;
        SetAnswers();
    }
}
