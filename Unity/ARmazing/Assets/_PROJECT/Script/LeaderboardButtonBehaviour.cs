using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.XR.ARFoundation;

public class LeaderboardButtonBehaviour : MonoBehaviour
{
    public void LeaderboardButton()
    {
        SceneManager.LoadScene("Leaderboard", LoadSceneMode.Single);
        LoaderUtility.Deinitialize();
    }
}
