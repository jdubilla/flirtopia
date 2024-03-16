//
//  SuggestionsViewModel.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 24/02/2024.
//

import SwiftUI

class SuggestionsViewModel: ObservableObject {
    
    private let baseUrl: String = "http://localhost:3000"
    
    @Published var idsSuggested: [SuggestedUser] = []
    @Published var userSuggestions: [UserSuggestion] = []
    @Published var photosUser: [UIImage] = []
    @Published var errorMessage: String = ""
    @Published var showAlert: Bool = false
    
    func getSuggestions() async throws {
        let baseUrl = "\(baseUrl)/users/suggestions"
        
        var urlComponents = URLComponents(string: baseUrl)!
        
        urlComponents.queryItems = [
            URLQueryItem(name: "maxDistance", value: "1000"),
            URLQueryItem(name: "differencePopularity", value: "5000"),
            URLQueryItem(name: "ageFrom", value: "1"),
            URLQueryItem(name: "ageTo", value: "100"),
        ]
        
        guard let url = urlComponents.url else {
            self.errorMessage = "Error, please try again later"
            self.showAlert = true
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = KeychainManager().getTokenFromKeychain() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        } else {
            self.errorMessage = "Error, please try again later"
            self.showAlert = true
            return
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            self.errorMessage = "Error, please try again later"
            self.showAlert = true
            return
        }
        
        if (httpResponse.statusCode != 200) {
            DispatchQueue.main.async {
                self.idsSuggested = []
                self.errorMessage = "Error, please try again later"
                self.showAlert = true
            }
            return
        }
        
        let decoder = JSONDecoder()
        DispatchQueue.main.async {
            do {
                let suggestedUsers = try decoder.decode([SuggestedUser].self, from: data)
                self.idsSuggested = Array(suggestedUsers.prefix(10))
            } catch {
                self.idsSuggested = []
                self.errorMessage = "Error, please try again later"
                self.showAlert = true
            }
        }
    }
    
    func getUsersFromSuggestions() async throws {
        var baseUrl = "\(baseUrl)/users/manyUsers?ids="
        
        if self.idsSuggested.isEmpty {
            return
        }
        
        let idsParams = self.idsSuggested.map { "\($0.id)" }.joined(separator: ",")
        baseUrl.append(idsParams)
                        
        let urlComponents = URLComponents(string: baseUrl)!

        guard let url = urlComponents.url else {
            self.errorMessage = "Error, please try again later"
            self.showAlert = true
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = KeychainManager().getTokenFromKeychain() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        } else {
            self.errorMessage = "Error, please try again later"
            self.showAlert = true
            return
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            self.errorMessage = "Error, please try again later"
            self.showAlert = true
            return
        }
        
        if (httpResponse.statusCode != 200) {
            DispatchQueue.main.async {
                self.errorMessage = "Error, please try again later"
                self.showAlert = true
                return
            }
        }
        
        let decoder = JSONDecoder()
        
        DispatchQueue.main.async {
            do {
                self.userSuggestions = try decoder.decode([UserSuggestion].self, from: data)
                
                let arrayUiImages = self.userSuggestions.compactMap { UIImage(data: $0.mainPhoto) }
                
                self.photosUser = arrayUiImages
            } catch {
                self.errorMessage = "Error, please try again later"
                self.showAlert = true
            }
        }
    }
}
