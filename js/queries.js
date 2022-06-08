function UserQ(username) {
    return `{
      user (where:{login: {_eq: "${username}"}}) {
        login
        id
      }
    }`
}

function searchUserLikeQ(input) {
    return `{
      user (where: {login: {_ilike: "%${input}%"}}, limit: 5) {
        login
      }
    }`
}

function TransactionsQ(userId, type, offset) {
    return `{
      transaction (where:{userId: {_eq: ${userId}}, type: {_eq: "${type}"}}, order_by: {createdAt: asc}, offset:${offset}){
      createdAt
      amount
      type
      userId
      path
      object{
        name
        type
      }
    }
    }`
}
