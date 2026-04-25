const db = require('../config/database');

//daily check-in
const dailyCheckin = async(req,res) =>{
    try{
        const{mood, note} = req.body;
        const today = new Date().toISOString().split('T')[0];

        //check if user already checked 2day
        const[existing]= await db.query(
            `SELECT id from checkins Where user_id = ? AND checkin_date = ?`,
            [req.user.id, today]
        );
        if (existing.length>0){
            return res.status(400).json({
                message: 'you already checked in today'
            });
        }
        //insert check-in
        await db.query(
            `INSERT INTO CHECKINS(user_id, checkin_date, mood, note) VALUES(?,?,?,?)`,
            [req.user.id, today, mood || 'good', note|| null]
        );
        //get streak data
        const[streakRows] = await db.query(
            `SELECT * FROM streaks WHERE user_id = ?`,
            [req.user.id]
        );
        const streak= streakRows[0];
        let newCurrentStreak =1;
        let newLongestStreak = streak.longest_streak;
        const yesterday= new Date();
        yesterday.setDate(yesterday.getDate()-1);
        const yesterdayDate = yesterday.toISOString().split('T')[0];
        //streak logic
        if(streak.last_checkin_date=== yesterdayDate){
            newCurrentStreak = streak.current_streak+1;
        } else if(streak.last_checkin_date === today){
            newCurrentStreak = streak.current_streak;
        }else{
            newCurrentStreak=1;
        }
        //update longest streak
        if(newCurrentStreak> newLongestStreak){
            newLongestStreak=newCurrentStreak;
        }
        //update streak table
        await db.query(
            `UPDATE streaks SET current_streak = ?, longest_streak = ?, last_checkin_date = ? WHERE user_id=?`,
            [newCurrentStreak, newLongestStreak, today, req.user.id]
        );
        return res.status(200).json({
            message:'check-in successful!',
            current_streak: newCurrentStreak,
            longest_streak: newLongestStreak
        });

        }catch(error){
            console.error('ceck-in error:', error);
            return res.status(500).json({message: 'server error'});
        }
        
    };
//get streak 
const getStreak = async (req, res)=>{
    try{
        const[row] = await db.query(
            `SELECT current_streak, longest_streak, last_checkin_date FROM streaks WHERE user_id= ?`,
            [req.user.id]
        );
        return res.status(200).json({
            streak: row[0]
        });
    }catch(error){
        console.error('get streak error:', error);
        return res.status(500).json({ message:'server error'});
    }
};
module.exports ={dailyCheckin, getStreak};