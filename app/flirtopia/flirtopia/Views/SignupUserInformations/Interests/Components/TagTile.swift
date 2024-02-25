//
//  TagTile.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 24/02/2024.
//

import SwiftUI

struct TagTile: View {
    
    let tag: Tag
    @StateObject var vm: InterestsViewModel
    
    var body: some View {
        Text(tag.tag_name)
            .padding(10)
            .font(.system(size: 23))
            .fontWeight(.semibold)
            .background(vm.selectedTags.contains(tag.tag_id) ?
                        AnyView(LinearGradient(gradient: Gradient(colors: [Color(hex: 0xCF0CB5), Color(hex: 0xFD5E64), Color(hex: 0xFEEB0B)]),
                                               startPoint: .leading,
                                               endPoint: .trailing)) :
                            AnyView(LinearGradient(gradient: Gradient(colors: [Color(hex: 0xffff00), Color(hex: 0xffffe5)]),
                                                   startPoint: .leading,
                                                   endPoint: .trailing)))
            .foregroundColor(vm.selectedTags.contains(tag.tag_id) ? .white : .black)
            .clipShape(RoundedRectangle(cornerRadius: 15))
            .onTapGesture {
                if vm.selectedTags.contains(tag.tag_id) {
                    vm.selectedTags.removeAll {$0 == tag.tag_id}
                } else if vm.selectedTags.count < 5 {
                    vm.selectedTags.append(tag.tag_id)
                }
            }
    }
}
