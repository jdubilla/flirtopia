//
//  LoginViewModel.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 23/02/2024.
//

import Foundation

class LoginViewModel: ObservableObject {
    
    private let baseUrl: String = "http://localhost:3000"
    
    @Published var username: String = ""
    @Published var password: String = ""
    @Published var navigate: Bool = false
    @Published var errorMessage: String = ""
    @Published var showAlert: Bool = false
    @Published var isButtonDisabled = false
    
    func signin() async throws {
        
        DispatchQueue.main.async {
            self.isButtonDisabled = true
        }
        
        defer {
            DispatchQueue.main.async {
                self.isButtonDisabled = false
            }
        }
        
        let url = URL(string: "\(baseUrl)/login/signin")!
        
        let jsonData: [String: Any] = [
            "username": username,
            "password": password
        ]
        
        let jsonDataSerialized = try JSONSerialization.data(withJSONObject: jsonData)
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.httpBody = jsonDataSerialized
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            self.errorMessage = "Internal error"
            self.showAlert = true
            return
        }
        
        if (httpResponse.statusCode != 200) {
            DispatchQueue.main.async {
                self.errorMessage = "Bad username or password"
                self.showAlert = true
            }
            return
        }
        
        let jsonObject = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        if let token = jsonObject?["token"] as? String {
            KeychainManager().saveTokenToKeychain(token: token)
            DispatchQueue.main.async {
                self.navigate = true
            }
            print("Token: \(token)")
        } else {
            print("Token not found in JSON")
        }
    }
}
