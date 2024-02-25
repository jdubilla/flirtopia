//
//  UserInformation.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 25/02/2024.
//

import SwiftUI

struct UserInformation: View {
    
    let systemName: String
    let info: String
    
    var body: some View {
        HStack {
            Image(systemName: systemName)
            Text(info)
        }    }
}

#Preview {
    UserInformation(systemName: "person", info: "Mathieu, 25")
}
