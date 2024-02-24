//
//  ButtonSignup.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 23/02/2024.
//

import SwiftUI

struct ButtonSignup: View {
    var body: some View {
        NavigationLink {
                SignupView()
        } label: {
            Text("Signup")
                .padding(EdgeInsets(top: 15, leading: 50, bottom: 15, trailing: 50))
                .frame(maxWidth: 250)
                .background(
                    LinearGradient(gradient: Gradient(colors: [Color(hex: 0xCF0CB5), Color(hex: 0xFD5E64), Color(hex: 0xFEEB0B)]), startPoint: .leading, endPoint: .trailing)
                )
                .clipShape(RoundedRectangle(cornerRadius: 20))
                .foregroundStyle(.white)
                .fontWeight(.bold)
                .font(.system(size: 24))
        }
    }
}

#Preview {
    ButtonSignup()
}
