import express from "express"
import cors from "cors"
import dotenv from 'dotenv'
import { v4 as uuidv4 } from "uuid"
import { StreamChat } from 'stream-chat';

/*
* Backend logic for running an backend-server via express and the stream-chat API
* Date of last changes: 15.10.2024
* Developer: D.Kim
*/

dotenv.config();  
// Get environment variables
const portNumber = process.env.PORT || 3001; 
const apiKey = process.env.API_KEY; 
const apiSecret = process.env.API_SECRET;

// Create an express server to exchange data
const app = express();
app.use(cors());
app.use(express.json());

// Create an instance to connect the account to the stream platform 
const serverClient = StreamChat.getInstance(apiKey, apiSecret);

// Clean-Up: Remove of old/offline users 
await deleteOldUsers()

// Get data from the frontend and provide specific User-ID and token
app.post("/setup", async (req, res) => {
    try{
        const gameSets = req.body.gameStates;
        const {playerName, playerNumber} = gameSets;  

        if(!playerName || !playerNumber){
            console.error("Error: Incomplete request body!")
        }
        const userID = uuidv4();                            // Generate a unique user ID
        const token = serverClient.createToken(userID);     // Create a specific token for authentication
        const userProps = {userID: userID, 
                           playerName: playerName, 
                           playerNumber: playerNumber};     // Set User properties

        res.json({userProps, token})                        // Provide response as json-data
        console.log("Response provided... ")
    }
    catch(error){
        console.error(error.message)
        res.json({ error: error });
    }
})

await getUsers();

// Start the server
app.listen(portNumber, () => {
    console.log(` Server is running on port: ${portNumber} `)
})

async function deleteOldUsers() {
    try {
      const response = await serverClient.queryUsers({});
      const usersToDelete = response.users.filter((user) => !user.online && user.role === 'user');
      await Promise.all(usersToDelete.map((user) => serverClient.deleteUser(user.id)));
      console.log('User clean-up completed.');

    } catch (error) {
      console.error('Error at deleting old users:', error);
    }
  }

// Function to get current users
async function getUsers(){
    const response = await serverClient.queryUsers({});
    console.log(">> Current users: ", response.users)
    
    return response.users
}