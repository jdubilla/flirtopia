//
//  UserProfileTagTile.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 25/02/2024.
//

import SwiftUI

struct UserProfileTagTile: View {
    
    let nameTag: String
    
    var body: some View {
        Text(nameTag)
            .padding(10)
            .font(.system(size: 18))
            .fontWeight(.semibold)
            .background(LinearGradient(gradient: Gradient(colors: [Color(hex: 0xCF0CB5), Color(hex: 0xFD5E64), Color(hex: 0xFEEB0B)]),
                                               startPoint: .leading,
                                               endPoint: .trailing))
            .foregroundColor(.white)
            .clipShape(RoundedRectangle(cornerRadius: 15))
    }
}

#Preview {
    UserProfileTagTile(nameTag: "Travel")
}
