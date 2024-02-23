//
//  LoginView.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 23/02/2024.
//

import SwiftUI

extension Color {
    init(hex: UInt32, alpha: Double = 1.0) {
        self.init(
            .sRGB,
            red: Double((hex & 0xFF0000) >> 16) / 255.0,
            green: Double((hex & 0x00FF00) >> 8) / 255.0,
            blue: Double(hex & 0x0000FF) / 255.0,
            opacity: alpha
        )
    }
}

struct LoginView: View {
    
    @State var username: String = ""
    @State var password: String = ""
    
    var body: some View {
        NavigationStack {
            VStack {
                Image("flirtopia")
                    .resizable()
                    .frame(width: 150, height: 150)
                LoginTextField(systemName: "person", placeholder: "Username", value: $username)
                Spacer().frame(height: 25)
                LoginTextField(systemName: "lock", placeholder: "Password", value: $password)
                Button(action: {
                    
                }, label: {
                    Text("Login")
                        .padding(EdgeInsets(top: 15, leading: 100, bottom: 15, trailing: 100))
                        .background(
                            LinearGradient(gradient: Gradient(colors: [Color(hex: 0xCF0CB5), Color(hex: 0xFD5E64), Color(hex: 0xFEEB0B)]), startPoint: .leading, endPoint: .trailing)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 20))
                        .foregroundStyle(.white)
                        .fontWeight(.bold)
                        .font(.system(size: 24))
                })
                HStack {
                    Rectangle().frame(height: 1).foregroundStyle(.gray)
                    Text("OR")
                    Rectangle().frame(height: 1).foregroundStyle(.gray)
                }
                Spacer()
            }
            .navigationTitle("Login")
            .padding(15)
        }
    }
}

#Preview {
    LoginView()
}
