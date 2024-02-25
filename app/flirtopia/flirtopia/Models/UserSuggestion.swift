//
//  UserSuggestion.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 24/02/2024.
//

import Foundation

struct UserSuggestion: Decodable, Hashable {
    let id: Int
    let firstName: String
    let mainPhoto: Data
    let age: Int
    let description: String
    let interests: [Int]
    let distance: Double
    let gender: String
    let preference: String
}

//[{"id":4,"username":"Khalid.Rutherford","firstName":"Estelle","lastName":"Glover","password":"$argon2id$v=19$m=65536,t=3,p=4$e9cJYI6Echy7rl1SGcU0Jw$Y+PAcPxIDjPqNjf+3/dbdFUPya2cvhQqBhfiwRp5j+E","birth":"1977-05-15T00:00:00.000Z","gender":"woman","preference":"both","description":"Et et commodi. Quas eum possimus fuga recusandae. Blanditiis quis ab corrupti. Nostrum ad facilis vitae vero et. In ratione et.","photo1":"woman/I.jpg","photo2":"woman/Z.jpg","photo3":"woman/W.jpg","photo4":"woman/V.jpg","photo5":"woman/H.jpg","all_infos_set":1,"location":"46.193401, 6.234109","verified":1,"verified_token":null,"popularity":150,"online":0,"lastConnection":"2024-02-24T20:02:54.000Z","password_token":null,"interests":[1,5,13,16,19],"distance":549.6,"age":46}]
