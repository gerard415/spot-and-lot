import {Account, Avatars, Client, OAuthProvider} from "react-native-appwrite"
import * as Linking from "expo-linking"
import { openAuthSessionAsync } from "expo-web-browser";

export const config = {
    platform: "com.gre.spotandlot",
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
}

//create a new client using the information above
export const client = new Client();
client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!);

export const avatar = new Avatars(client) //allow avatars to be created by using the users first and last name
export const account = new Account(client) //the user's account

export async function login() {
    try {
      const redirectUri = Linking.createURL("/"); //redirect to the home page
  
      const response = await account.createOAuth2Token( //request an oauth token from appwrite
        OAuthProvider.Google,
        redirectUri
      );
      if (!response) throw new Error("Create OAuth2 token failed");
  
      const browserResult = await openAuthSessionAsync(  //use the response to create an auth session (like when a browser opens in an app to log you in)
        response.toString(),
        redirectUri
      );
      if (browserResult.type !== "success")
        throw new Error("Create OAuth2 token failed");
  
      const url = new URL(browserResult.url);
      const secret = url.searchParams.get("secret")?.toString();
      const userId = url.searchParams.get("userId")?.toString();
      if (!secret || !userId) throw new Error("Create OAuth2 token failed");
  
      const session = await account.createSession(userId, secret); //use the info from the browser result to create a login session
      if (!session) throw new Error("Failed to create session");
  
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  export async function logout() {
    try {
      const result = await account.deleteSession("current"); //delete current session to logout
      return result;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  export async function getCurrentUser() { //get current user information
    try {
      const result = await account.get();
      if (result.$id) {
        const userAvatar = avatar.getInitials(result.name); //create an avatar using the user's initials
  
        return {
          ...result,
          avatar: userAvatar.toString(),  //return the result plus the avatar
        };
      }
  
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }