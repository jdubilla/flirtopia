//
//  UserProfileViewModel.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 25/02/2024.
//

import SwiftUI

class UserProfileViewModel: ObservableObject {
    
    private let baseUrl: String = "http://localhost:3000"
    
    @Published var indexSelectedImage = 0
    @Published var errorMessage: String = ""
    @Published var showAlert: Bool = false
    @Published var photosUser: [UIImage] = []
    @Published var tags: [Tag] = []
    @Published var relation: Int = 0
    
    
    func getPhotosUser(id: Int) async throws {
        let url = URL(string: "\(baseUrl)/users/photo/\(id)")!
        
        var request = URLRequest(url: url)
        
        if let token = KeychainManager().getTokenFromKeychain() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        } else {
            fatalError("Impossible de récupérer le jeton d'autorisation")
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            self.errorMessage = "Error, please try again later"
            self.showAlert = true
            return
        }
        
        if (httpResponse.statusCode != 200) {
            self.errorMessage = "Error, please try again later"
            self.showAlert = true
            return
        }
        
        let decoder = JSONDecoder()
        
        DispatchQueue.main.async {
            do {
                let photos = try decoder.decode(PhotosUser.self, from: data)
                let arrayPhotos: [Data] = [photos.photo1, photos.photo2, photos.photo3, photos.photo4, photos.photo5]
                
                let arrayUiImages = arrayPhotos.compactMap { UIImage(data: $0) }
                
                self.photosUser = arrayUiImages
                
            } catch {
                print("Error photos decoder \(error)")
            }
        }
    }
    
    func getTags() async throws {
        let url = URL(string: "\(baseUrl)/users/tags")!
        
        var request = URLRequest(url: url)
        
        if let token = KeychainManager().getTokenFromKeychain() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        } else {
            fatalError("Impossible de récupérer le jeton d'autorisation")
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            self.errorMessage = "Error, please try again later"
            self.showAlert = true
            return
        }
        
        if (httpResponse.statusCode != 200) {
            self.errorMessage = "Error, please try again later"
            self.showAlert = true
            return
        }
        
        let decoder = JSONDecoder()
        
        DispatchQueue.main.async {
            do {
                self.tags = try decoder.decode([Tag].self, from: data)
            } catch {
                print("Error photos decoder \(error)")
            }
        }
    }
    
    func getRelation(id: Int) async throws {
        let url = URL(string: "\(baseUrl)/users/relation/\(id)")!
        
        var request = URLRequest(url: url)
        
        if let token = KeychainManager().getTokenFromKeychain() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        } else {
            fatalError("Impossible de récupérer le jeton d'autorisation")
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            self.errorMessage = "Error, please try again later"
            self.showAlert = true
            return
        }
        
        if (httpResponse.statusCode != 200) {
            self.errorMessage = "Error, please try again later"
            self.showAlert = true
            return
        }
        
        let decoder = JSONDecoder()
        
        DispatchQueue.main.async {
            do {
                let userRelation = try decoder.decode([Int].self, from: data)
                if (userRelation.isEmpty) {
                    self.relation = 0
                }
            } catch {
                print("Error photos decoder \(error)")
            }
        }
    }
    
    func updateRelation() {
        self.relation = self.relation == 0 ? 1 : 0
    }
}
