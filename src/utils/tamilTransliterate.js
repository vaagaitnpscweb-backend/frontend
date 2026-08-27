// src/utils/tamilTransliterate.js

// Google Transliterate API மூலம் தங்க்லீஷை (Thanglish) துல்லியமான தமிழாக மாற்றும் ஃபங்ஷன்
export const fetchTamilWord = async (word) => {
  if (!word || word.trim() === '') return word;

  try {
    const response = await fetch(
      `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=ta-t-i0-und&num=1`
    );
    const data = await response.json();

    // கூகுள் தரும் முதல் தமிழ் வார்த்தையை எடுத்தல்
    if (data && data[1] && data[1][0] && data[1][0][1] && data[1][0][1][0]) {
      return data[1][0][1][0];
    }
    return word;
  } catch (error) {
    console.error("Tamil transliteration error:", error);
    return word;
  }
};