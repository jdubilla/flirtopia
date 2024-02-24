//
//  SignupViewModel.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 23/02/2024.
//

import Foundation

class SignupViewModel: ObservableObject {
    
    private let baseUrl: String = "http://localhost:3000"
    
    @Published var username: String = ""
    @Published var firstName: String = ""
    @Published var lastName: String = ""
    @Published var password: String = ""
    @Published var confirmPassword: String = ""
    @Published var isButtonDisabled: Bool = true
    @Published var errorMessage: String = ""
    @Published var showAlert: Bool = false
    
    private func handleHTTPResponse(_ httpResponse: HTTPURLResponse) {
            DispatchQueue.main.async {
                if httpResponse.statusCode == 401 {
                    self.errorMessage = "Bad parameters"
                } else if httpResponse.statusCode == 409 {
                    self.errorMessage = "Username already taken"
                } else if httpResponse.statusCode == 500 {
                    self.errorMessage = "Internal error"
                } else {
                    self.errorMessage = "Unexpected error with status code \(httpResponse.statusCode)"
                }
                self.showAlert = true
            }
    }
        
    func signup() async throws {
        
        DispatchQueue.main.async {
            self.isButtonDisabled = true
        }
        
        defer {
            DispatchQueue.main.async {
                self.isButtonDisabled = false
            }
        }
        
        let url = URL(string: "\(baseUrl)/login/signup")!
        
        let jsonData: [String: Any] = [
            "username": username,
            "firstName": firstName,
            "lastName": lastName,
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
            self.handleHTTPResponse(httpResponse)
            return
        }
        
        let jsonObject = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        if let token = jsonObject?["token"] as? String {
            KeychainManager().saveTokenToKeychain(token: token)
        } else {
            print("Token not found in JSON")
        }
    }
    
    func updateButtonState() {
        isButtonDisabled = buttonDisabled()
    }
    
    func buttonDisabled() -> Bool {
        if (username.isEmpty || firstName.isEmpty || lastName.isEmpty || password.isEmpty || confirmPassword.isEmpty) {
            return true
        }
        else if (password != confirmPassword) {
            return true
        }
        return false
    }
}
