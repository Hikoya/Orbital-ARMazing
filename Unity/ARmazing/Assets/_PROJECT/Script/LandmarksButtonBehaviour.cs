using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.XR.ARFoundation;

public class LandmarksButtonBehaviour : MonoBehaviour
{
    /**
     * Called once the landmarks button is pressed and loads the Landmark scene
     */
    public void LandmarksButton()
    {
        SceneManager.LoadScene("Landmark", LoadSceneMode.Single);
        LoaderUtility.Deinitialize();
    }
}
