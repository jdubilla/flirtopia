//
//  LoginButtonSeparator.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 23/02/2024.
//

import SwiftUI

struct LoginButtonSeparator: View {
    var body: some View {
        HStack {
            Rectangle().frame(height: 1).foregroundStyle(.gray)
            Text("OR")
                .foregroundStyle(.gray)
                .fontWeight(.bold)
            Rectangle().frame(height: 1).foregroundStyle(.gray)
        }
    }
}

#Preview {
    LoginButtonSeparator()
}
