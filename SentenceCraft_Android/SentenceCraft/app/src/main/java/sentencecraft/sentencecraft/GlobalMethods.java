package sentencecraft.sentencecraft;

/**
 * Created by zqiu on 4/27/16.
 */
public class GlobalMethods {

    public static boolean lexemeIsWord = false;

    public static String getBaseURL() {
        return "http://10.0.2.2:5000/";
    }

    public static String getStartSentenceExtension() {
        return "start/";
    }

    public static String getContinueSentenceRequest() {
        return "incomplete/";
    }

    public static String getContinueSentencePost() {
        return "append/";
    }

    public static String getViewExtension(){
        return "view/";
    }

    public static String getTypeExtension(){
        return "type=" + getLexeme();
    }

    public static String getLexeme(){
        if(lexemeIsWord){
            return "word";
        }else{
            return "sentence";
        }
    }

    public static String getLexemeCollection(){
        if(lexemeIsWord){
            return "sentence";
        }else{
            return "paragraph";
        }
    }
}
