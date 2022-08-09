using System.Collections;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class MapsButtonBehaviour : MonoBehaviour
{
	void Start()
	{
		Button btn = GetComponent<Button>();
		btn.onClick.AddListener(TaskOnClick);
	}

	void TaskOnClick()
	{
		string latValue = transform.parent.Find("LatitudeText").GetComponent<TMP_Text>().text;
		string longValue = transform.parent.Find("LongitudeText").GetComponent<TMP_Text>().text;
		string latValueTrunc = latValue.Split(":")[1];
		string longValueTrunc = longValue.Split(":")[1];
		//latValue = "1.2921898";
		//longValue = "103.7813710";
		string URL = "https://www.google.com/maps?q=" + latValueTrunc + "," + longValueTrunc;
		//string URL = "https://www.google.com/maps?q=1.2921898,103.7813710";
		Application.OpenURL(URL);
	}
}
