const db = require('../config/database');
//send friend request
const sendRequest = async (req,res)=>{
    try{
        const{userId}= req.body;
        if(!userId){
            return res.status(400).json({message: 'user id is requires'});
        }
        if(userId === req.user.id){
            return res.status(400).json({message: 'you cannot add yourself'});
        }
        //check if already exists
        const [existing] = await db.query(
             `SELECT * FROM friendships 
       WHERE (requester_id = ? AND receiver_id = ?)
          OR (requester_id = ? AND receiver_id = ?)`,
          [req.user.id, userId, userId, req.user.id]
        );
        if(existing.length>0){
            return res.status(400).json({message: 'request already exists'});
        }
        await db.query(
            `INSERT INTO friendships (requester_id, receiver_id) VALUES(?,?)`,
            [req.user.id, userId]
        );
        return res.status(201).json({
            messsage:'friends request sent!'
        });

    }catch(error){
        console.error('Send request error:', error);
        return res.status(500).json({message: 'server error'});
    }
};
//accept friend request
const acceptRequest = async (req,res)=>{
    try{
        const {requestId} = req.body;
        const [request]= await db.query(
            `SELECT * FROM friendships
             WHERE id =? AND receiver_id =?`,
            [requestId, req.user.id]
        );
        if (request.length ===0){
            return res.status(404).json({message: 'request not found'});
        }
        await db.query(
            `UPDATE friendships
            SET status ='accepted'
            WHERE id =?`,
            [requestId]
        );
        return res.status(200).json({
            message:'friend request accepted!'
        });
    }catch(error){
        console.error('Accept request error:', error);
        return res.status(500).json({message: 'server error'});
    }
};
//get friends list
const getFriends = async(req,res)=>{
    try{
        const[friends] = await db.query(
            `SELECT u.id, u.username, u.full_name, u.avatar_url
            FROM friendships f
            JOIN users u
             ON (u.id = f.requester_id OR f.receiver_id)
             WHERE(f.requester_id = ? OR f.receiver_id= ?)
             AND f.status = 'accepted'
             AND u.id != ?`,
             [req.user.id, req.user.id, req.user.id]
        );
        return res.status(200).json({
            total_friends: friends.length, friends
        });      
    }catch(error){
        console.error('get friends error:', error);
        return res.status(500).json({message: 'server error'});
    }
};
//vew freind profile
const getFriendProfile = async (req,res) =>{
    try{
        const {id} = req.params;
        //check if they are friends 
        const [relation] = await db.query(
            `SELECT * FROM friendships 
            WHERE ((requester_id = ? AND receiver_id = ?) 
            OR (requester_id = ? AND receiver_id = ?))
            AND status = 'accepted'`,
            [req.user.id, id, id, req.user.id]
        );
        if(relation.length === 0){
             return res.status(403).json({ message: 'Not friends' });
        }
        const [user] = await db.query(
            `SELECT id, username, full_name, avatar_url, bio, fitness_goal FROM users WHERE id = ?`,
            [id]
        );
        return res.status(200).json({
            friends: user[0]
        });
    }catch(error){
        console.error('friends profile error:', error);
        return res.status(500).json({ message: 'Server error'});
    }
}
module.exports={
    sendRequest,
    acceptRequest,
    getFriends,
    getFriendProfile
};