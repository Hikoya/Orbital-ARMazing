using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.XR.ARFoundation;

public class LeaderboardButtonBehaviour : MonoBehaviour
{
    /**
     * Called once the leaderboard button is pressed and loads the Leaderboard scene
     */
    public void LeaderboardButton()
    {
        SceneManager.LoadScene("Leaderboard", LoadSceneMode.Single);
        LoaderUtility.Deinitialize();
    }
}
