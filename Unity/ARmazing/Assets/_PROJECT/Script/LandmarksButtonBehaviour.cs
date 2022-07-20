using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.XR.ARFoundation;

public class LandmarksButtonBehaviour : MonoBehaviour
{
    public void LandmarksButton()
    {
        SceneManager.LoadScene("Landmark", LoadSceneMode.Single);
        LoaderUtility.Deinitialize();
    }
}
