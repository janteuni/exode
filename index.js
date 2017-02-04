require('dotenv').config()

const fs = require('fs')
const Twitter = require('twitter')
const TWEET_ID = '827066861833555968'
const MERIID = '865525736'

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
})

//getRetweets(TWEET_ID).then(res => {})
getFollowers(MERIID).then(res => console.log(res.length)).catch(err => console.log(err))

function getRetweets(tweetId) {
  return new Promise((res, rej) => {
    if (process.env.MOCK === '1') {
      const content = fs.readFileSync('retweets.json', { encoding: 'utf8' })
      res(JSON.parse(content))
    } else {
      const params = { count: 100 }
      client.get(`statuses/retweets/${tweetId}`, params, (error, retweets, response) => {
        if (error) { return rej() }
        retweets = retweets.map(retweet => {
          const followers = []
          return {
            date: retweet.created_at,
            user: {
              id: retweet.user.id,
              picture: retweet.user.profile_image_url,
              followers,
            }
          }
        })
        res(retweets)
      })
    }
  })
}

function getFollowers(userId, cursor, total) {
  if (!cursor) { cursor = -1 }
  if (!total) { total = [] }
  return new Promise((res, rej) => {
    const params = {
      user_id: userId,
      count: 10,
      cursor,
    }
    client.get('followers/list', params, function(error, followers, response) {
      console.log('getting from ' + cursor)
      if (error) { return rej(error) }
      total = [...total, ...followers.users]
        console.log(total)
      if (followers.next_cursor === 0) {
        return res(total)
      } else {
        return getFollowers(userId, followers.next_cursor, total)
      }
    })
  })
}
