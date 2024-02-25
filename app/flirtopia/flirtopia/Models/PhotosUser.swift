//
//  PhotosUser.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 25/02/2024.
//

import Foundation

struct PhotosUser: Decodable, Hashable {
    let photo1: Data
    let photo2: Data
    let photo3: Data
    let photo4: Data
    let photo5: Data
}
