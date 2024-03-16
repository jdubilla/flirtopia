//
//  UserProfile.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 25/02/2024.
//

import SwiftUI
import WrappingHStack

struct UserProfile: View {
    
    let user: UserSuggestion
    
    @StateObject var vm = UserProfileViewModel()
    
    var body: some View {
        VStack(alignment: .leading) {
            TabView(selection: $vm.indexSelectedImage) {
                ForEach(0..<vm.photosUser.count, id: \.self) { index in
                    Image(uiImage: vm.photosUser[index])
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(height: 625)
                        .tag(index)
                }
            }
            .frame(height: 430)
            .tabViewStyle(PageTabViewStyle())
            .indexViewStyle(PageIndexViewStyle(backgroundDisplayMode: .always))
            VStack(alignment: .leading, spacing: 10) {
                Text("\(user.firstName), \(user.age)")
                    .font(.title)
                    .fontWeight(.bold)
                UserInformation(systemName: "location", info: "\(Int(user.distance)) Km from you")
                UserInformation(systemName: "person", info: user.gender.capitalized)
                UserInformation(systemName: "heart", info: user.preference.capitalized)
                WrappingHStack(user.interests, id: \.self) { tagId in
                    if let tag = vm.tags.first(where: { $0.tag_id == tagId }) {
                        UserProfileTagTile(nameTag: tag.tag_name)
                    }
                }
                Text("About me")
                    .font(.title)
                    .fontWeight(.bold)
                Text(user.description)
                HStack {
                    Spacer()
                    Button {
                        vm.updateRelation()
                    } label: {
                        Image(systemName: vm.relation == 0 ? "heart" : "heart.fill")
                            .resizable()
                            .frame(width: 30, height: 30)
                            .foregroundStyle(.white)
                    }
                    .frame(width: 50, height: 50)
                    .background(.pink)
                    .clipShape(Circle())
                    Spacer()
                }
            }.padding(15)
            Spacer()
        }
        .ignoresSafeArea(.all)
        .task {
            do {
                try await vm.getPhotosUser(id: user.id)
                try await vm.getTags()
                try await vm.getRelation(id: user.id)
            } catch {
                print("Error")
            }
        }
    }
}
