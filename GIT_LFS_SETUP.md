# Git LFS Setup - Complete ✅

Git Large File Storage (LFS) has been configured for this repository to efficiently handle binary files.

## What Changed

### Files Now Tracked by Git LFS

All binary files are now stored in Git LFS instead of directly in the repository:

```
✓ invitation1.png (2.8 MB)
✓ twitching_body/assets/crying-ghost.mp3
✓ twitching_body/raspberry_pi_audio/audio/crying-ghost.mp3
✓ window_spider_trigger/public/videos/spider_jump1.mp4 (850 KB)
✓ window_spider_trigger/public/videos/videoframe_0.png (638 KB)
✓ window_spider_trigger/public/videos/videoframe_n.png (503 KB)
```

**Total LFS storage:** ~34 MB

### File Types Tracked

The following file types are automatically tracked by Git LFS (see `.gitattributes`):

- `*.mp3` - Audio files
- `*.mp4` - Video files
- `*.png` - PNG images
- `*.jpg` - JPEG images
- `*.jpeg` - JPEG images

### Configuration Files

1. **`.gitattributes`** - Defines which file types use LFS
   ```
   *.mp4 filter=lfs diff=lfs merge=lfs -text
   *.png filter=lfs diff=lfs merge=lfs -text
   *.mp3 filter=lfs diff=lfs merge=lfs -text
   *.jpg filter=lfs diff=lfs merge=lfs -text
   *.jpeg filter=lfs diff=lfs merge=lfs -text
   ```

2. **`window_spider_trigger/.gitignore`** - Updated to allow video files
   - Removed: `public/videos/*.mp4` (now tracked by LFS)
   - Removed: `public/videos/*.webm` (now tracked by LFS)
   - Removed: `public/videos/*.mov` (now tracked by LFS)

## Important: History Was Rewritten

The Git LFS migration rewrote the repository history to convert existing binary files to LFS pointers. This means:

⚠️ **Your local branch has diverged from the remote repository**

## Next Steps

### If You Haven't Pushed Yet

If this is a new repository or you haven't pushed to a remote yet, simply push:

```bash
git push origin main --force-with-lease
```

### If You Have a Remote Repository

Since the history was rewritten, you'll need to force push:

**Option 1: Force push (if you're the only developer)**
```bash
git push origin main --force-with-lease
```

**Option 2: Create a new branch (safer for shared repos)**
```bash
# Create a new branch with LFS-enabled history
git checkout -b main-with-lfs

# Push the new branch
git push origin main-with-lfs

# On GitHub/GitLab, create a PR to merge main-with-lfs → main
# Then update the default branch to main-with-lfs if desired
```

### For Other Team Members (After Force Push)

If you force-pushed and others have cloned the repo, they'll need to:

```bash
# Backup any local changes first!
git fetch origin
git reset --hard origin/main
```

## Using Git LFS Going Forward

### Cloning the Repository

When someone clones this repo, they need Git LFS installed:

```bash
# Install Git LFS (one-time setup)
git lfs install

# Clone the repository (LFS files download automatically)
git clone <repo-url>
```

### Adding New Binary Files

Simply add and commit as normal - LFS handles it automatically:

```bash
# Add a new video file
cp my_video.mp4 window_spider_trigger/public/videos/
git add window_spider_trigger/public/videos/my_video.mp4
git commit -m "Add new video"
git push
```

The file will automatically be tracked by LFS based on `.gitattributes`.

### Checking LFS Status

```bash
# List all files tracked by LFS
git lfs ls-files

# Check LFS storage size
du -sh .git/lfs

# Get LFS info
git lfs env
```

## Benefits of Git LFS

✅ **Smaller repository size** - Binary files stored separately
✅ **Faster clones** - Download only the files you need
✅ **Better performance** - Git operations faster with smaller repo
✅ **Version control** - Still track changes to binary files
✅ **Bandwidth efficiency** - Only download changed files

## LFS Storage Limits

Be aware of LFS storage limits on your hosting platform:

- **GitHub:** 1 GB free, 50 GB bandwidth/month
- **GitLab:** 10 GB free
- **Bitbucket:** 1 GB free

Current usage: ~34 MB (well within free limits)

## Troubleshooting

### "This repository is over its data quota"

If you exceed storage limits:
```bash
# Remove old LFS objects no longer referenced
git lfs prune

# Or purchase additional storage from your Git host
```

### LFS files not downloading

```bash
# Ensure LFS is installed
git lfs install

# Fetch LFS files
git lfs pull
```

### Check which files are LFS vs regular

```bash
# LFS files show as pointers (small text files)
git lfs ls-files

# Regular files
git ls-files | grep -v "$(git lfs ls-files | cut -d' ' -f3)"
```

## References

- [Git LFS Documentation](https://git-lfs.github.com/)
- [GitHub LFS Guide](https://docs.github.com/en/repositories/working-with-files/managing-large-files)
- [GitLab LFS Guide](https://docs.gitlab.com/ee/topics/git/lfs/)

---

**Setup completed:** 2025-10-19
**LFS storage:** ~34 MB
**Files tracked:** 6 binary files
**File types:** mp3, mp4, png, jpg, jpeg
