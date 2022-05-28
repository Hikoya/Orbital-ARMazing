using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class JoinEventManager : MonoBehaviour
{
    public void JoinEventButton()
    {
        //TODO call backend API to join event (if active) and download necessary event assets
        SceneManager.LoadScene("AR");
    }
}
