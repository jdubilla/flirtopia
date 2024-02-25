//
//  SuggestedUser.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 24/02/2024.
//

import Foundation

struct SuggestedUser: Decodable, Hashable {
    let id: Int
    let commonTags: Int
    let note: Int
}
