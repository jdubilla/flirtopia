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
}
